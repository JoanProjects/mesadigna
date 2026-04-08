namespace Core.Domain.Exception;


public class ConflictException : System.Exception
{
    public string? Field { get; }

    public ConflictException(string message, string? field = null)
        : base(message)
    {
        Field = field;
    }
    
}