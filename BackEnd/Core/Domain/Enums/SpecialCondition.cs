namespace Core.Domain.Enums;

[Flags]
public enum SpecialCondition
{
    Ninguna = 0,
    AdultoMayor = 1,
    Menor = 2,
    Embarazada = 4,
    Lactancia = 8,
    Discapacidad = 16
}
