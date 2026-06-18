namespace LoudApi.Presentation;

public sealed record VisualSection(
    string Slug,
    string Eyebrow,
    string Heading,
    string Body);

public sealed record PaletteColor(
    string Name,
    string Hex);

public sealed record PresentationAction(
    string Type,
    string Label,
    string Href);

public sealed record SectionInformation(
    string Brand,
    VisualSection Section,
    IReadOnlyList<PaletteColor> Palette);
