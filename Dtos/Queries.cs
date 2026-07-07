namespace LoudApi.Presentation;

public sealed record PresentationQuery(string? Section = null)
{
    public bool HasSection => !string.IsNullOrWhiteSpace(Section);

    public string? NormalizedSection => Section?.Trim().ToLowerInvariant();
}
