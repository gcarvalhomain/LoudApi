namespace LoudApi.Priorities;

public sealed record CreatePriorityRequest(string Title, string? Description);

public sealed record UpdatePriorityRequest(string Title, string? Description, bool IsDone);


