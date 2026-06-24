using System.Collections.Generic;

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
        Brand: "VELOTV",
        Title: " The GRANDSLAM OF EVENTS",
        Subtitle: "Counter-Strike 2 event circuit",
        Description: "VELOTV tracks the most important Counter-Strike stages of 2026 with a clean arena-style experience built around crowds, tickets, news and player movement.",
        Sections:
        [
            new(
                Slug: "hero",
                Eyebrow: "Events",
                Heading: "LANXESS Arena",
                Body: "IEM Cologne Major playoffs and the strongest crowd identity of the season."),
            new(
                Slug: "identity",
                Eyebrow: "Tickets",
                Heading: "Weekend pass",
                Body: "Ticket alerts, arena seating, premium passes and final-weekend reminders."),
            new(
                Slug: "showcase",
                Eyebrow: "News",
                Heading: "Major watch",
                Body: "Headlines, roster updates and fan guides that make the event feel alive."),
            new(
                Slug: "community",
                Eyebrow: "Sales and buys players",
                Heading: "Player market",
                Body: "Roster movement, buy targets, sale watch and academy call-ups between match days.")
        ],
        Palette:
        [
            new("Arena brown", "#8b5e34"),
            new("Warm white", "#fffaf2"),
            new("Black stage", "#090806")
        ],
        Actions:
        [
            new("primary", "Get ticket alerts", "/#tickets"),
            new("secondary", "Track player market", "/#players")
        ]);
}
