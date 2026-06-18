namespace LoudApi.Presentation;

public sealed record Informations(
    string Brand,
    string Title,
    string Subtitle,
    string Description,
    IReadOnlyList<VisualSection> Sections,
    IReadOnlyList<PaletteColor> Palette,
    IReadOnlyList<PresentationAction> Actions)
{
    public static Informations LoudHome => new(
        Brand: "Loud",
        Title: "Loud visual experience",
        Subtitle: "Uma pagina unica, forte e focada em impacto visual.",
        Description: "Base de conteudo para uma landing page real da Loud, pronta para alimentar o front-end.",
        Sections:
        [
            new(
                Slug: "hero",
                Eyebrow: "Main stage",
                Heading: "A energia da Loud em uma tela.",
                Body: "Um primeiro viewport com presenca de marca, contraste alto e foco em imagem, video ou cena interativa."),
            new(
                Slug: "identity",
                Eyebrow: "Identidade",
                Heading: "Som, movimento e comunidade.",
                Body: "A pagina deve comunicar cultura digital, performance e uma experiencia visual direta."),
            new(
                Slug: "showcase",
                Eyebrow: "Visual",
                Heading: "Um unico trabalho, bem apresentado.",
                Body: "A API entrega blocos claros para o front-end montar uma composicao enxuta e profissional.")
        ],
        Palette:
        [
            new("Electric green", "#00ff66"),
            new("Ink black", "#050505"),
            new("Signal white", "#f7f7f2")
        ],
        Actions:
        [
            new("primary", "Ver experiencia", "/presentation"),
            new("secondary", "Ler secoes", "/presentation/hero")
        ]);
}
