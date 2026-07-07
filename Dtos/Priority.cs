using System;

namespace LoudApi.Priorities;

public sealed class Priority
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public bool IsDone { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
