use anyhow::Context;

#[derive(clap::Parser)]
struct Cli {
    svg: std::path::PathBuf,
    out_dir: std::path::PathBuf,
}

fn main() -> anyhow::Result<()> {
    let cli = <Cli as clap::Parser>::parse();

    let tree = resvg::usvg::Tree::from_str(
        &std::fs::read_to_string(cli.svg).context("failed to read svg file")?,
        &resvg::usvg::Options::default(),
    )?;
    let original_size = tree.size();
    assert_eq!(original_size.width(), 4096.0);
    assert_eq!(original_size.height(), 4096.0);

    for size in [100_u16, 200_u16, 600_u16, 1200_u16] {
        let new_size =
            resvg::usvg::Size::from_wh(f32::from(size), f32::from(size)).context("invalid size")?;
        let transform = resvg::usvg::Transform::from_scale(
            new_size.width() / original_size.width(),
            new_size.height() / original_size.height(),
        );
        let mut pixmap = resvg::tiny_skia::Pixmap::new(u32::from(size), u32::from(size))
            .context("failed to create pixmap")?;
        resvg::render(&tree, transform, &mut pixmap.as_mut());

        let file_path = cli.out_dir.join(format!("bouzuya-{}x{}.png", size, size));
        let file = std::fs::File::create(&file_path).context("failed to create file")?;
        let mut encoder = png::Encoder::new(file, u32::from(size), u32::from(size));
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        encoder
            .write_header()
            .context("failed to write PNG header")?
            .write_image_data(pixmap.data())
            .context("failed to write PNG image data")?;
    }

    Ok(())
}
