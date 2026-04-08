namespace Application.DTOS.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public Dictionary<string, string[]>? FieldErrors { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Operación exitosa.")
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message, List<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors };

    public static ApiResponse<T> ConflictField(string message, string field, string fieldMessage)
        => new()
        {
            Success = false,
            Message = message,
            FieldErrors = new Dictionary<string, string[]>
            {
                { field, new[] { fieldMessage } }
            }
        };
}
