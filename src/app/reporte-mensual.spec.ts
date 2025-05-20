import { ReporteMensual } from './reporte-mensual';
import { Animal } from './animal';
import { ReservaVisita } from './reserva-vista';
import { TratamientoVeterinario } from './tratamiento-veterinario';
import { mock, instance, when, verify, spy } from 'ts-mockito';

describe('ReporteMensual – Pruebas de integración', () => {
  let reporte: ReporteMensual;

  beforeEach(() => {
    // Se ejecuta antes de cada prueba
  });

  afterEach(() => {
    // Se ejecuta después de cada prueba
  });

  it('stub – contarAnimalesNuevos() debe contar solo los animales ingresados en el mes/año dados', () => {
    // Objetivo: validar que solo se cuentan animales con fechaIngreso en 5/2025.
    // Datos: un stub de Animal con fecha 15-may-2025 y otro con fecha 10-abr-2025.
    // Resultado esperado: 1.
    //
    // Justificación: usamos un stub pues solo queremos fijar el valor de getFechaIngreso()
    // sin verificar interacciones.
    const animalStub1 = mock(Animal);
    when(animalStub1.getFechaIngreso()).thenReturn(new Date('2025-05-15'));
    const animalStub2 = mock(Animal);
    when(animalStub2.getFechaIngreso()).thenReturn(new Date('2025-04-10'));

    reporte = new ReporteMensual(
      5, 2025,
      [ instance(animalStub1), instance(animalStub2) ],
      [],
      []
    );

    expect(reporte.contarAnimalesNuevos()).toBe(1);
  });

  it('mock – calcularTotalVisitantes() debe sumar solo visitantes de reservas en el mes/año dados', () => {
    // Objetivo: validar que el total suma solo las reservas de 5/2025.
    // Datos: mock de ReservaVisita con fecha 10-may-2025 → 3 visitantes,
    //       otro con fecha 10-abr-2025 → 5 visitantes.
    // Resultado esperado: 3.
    //
    // Justificación: usamos mock para poder luego verificar que getVisitantes()
    // fue invocado exactamente las veces esperadas.
    const reservaMock1 = mock(ReservaVisita);
    when(reservaMock1.getFecha()).thenReturn(new Date('2025-05-10'));
    when(reservaMock1.getVisitantes()).thenReturn(3);

    const reservaMock2 = mock(ReservaVisita);
    when(reservaMock2.getFecha()).thenReturn(new Date('2025-04-10'));
    when(reservaMock2.getVisitantes()).thenReturn(5);

    reporte = new ReporteMensual(
      5, 2025,
      [],
      [ instance(reservaMock1), instance(reservaMock2) ],
      []
    );

    const total = reporte.calcularTotalVisitantes();
    expect(total).toBe(3);
    // Verificamos la interacción con el mock
    verify(reservaMock1.getVisitantes()).once();
    verify(reservaMock2.getVisitantes()).never();
  });

  it('spy – listarAnimalesTratados() debe devolver nombres únicos de animales tratados en el mes/año dados', () => {
    // Objetivo: validar filtrado por fecha y eliminación de duplicados.
    // Datos: dos tratamientos reales con mismo Animal ('Leo') en 5/2025.
    // Resultado esperado: ['Leo'].
    //
    // Justificación: usamos spy para envolver objetos reales y verificar llamadas
    // a sus métodos (p.ej. getAnimal()).
    const realAnimal = new Animal('1', 'Leo', 'Leon', new Date('2025-05-01'), 100, 'Estable');

    const tratamiento1 = new TratamientoVeterinario(
      'T1', realAnimal, 'Chekeo', new Date('2025-05-02'), 5, 50
    );
    const tratamiento2 = new TratamientoVeterinario(
      'T2', realAnimal, 'Vacuna', new Date('2025-05-15'), 3, 30
    );
    const spyT1 = spy(tratamiento1);
    const spyT2 = spy(tratamiento2);

    reporte = new ReporteMensual(
      5, 2025,
      [],
      [],
      [ instance(spyT1), instance(spyT2) ]
    );

    const tratados = reporte.listarAnimalesTratados();
    expect(tratados).toEqual(['Leo']);
    // Verificamos que se haya accedido al método getAnimal() de cada spy
    verify(spyT1.getAnimal()).once();
    verify(spyT2.getAnimal()).once();
  });

  it('integración completa – generarResumen() debe combinar todos los conteos correctamente', () => {
    // Objetivo: validar que generarResumen() agregue los tres conteos en el formato esperado.
    // Datos:
    //  - Un animal en 5/2025 (stub),
    //  - Una reserva en 5/2025 con 4 visitantes (mock),
    //  - Un tratamiento en 5/2025 para 'Mia' (real).
    // Resultado esperado: 
    //   Resumen 5/2025:
    //   - Animales ingresados: 1
    //   - Total de visitantes: 4
    //   - Animales tratados: 1
    //
    // Justificación: combina stub, mock y objeto real para máxima cobertura.
    const animalStub = mock(Animal);
    when(animalStub.getFechaIngreso()).thenReturn(new Date('2025-05-20'));

    const reservaMock = mock(ReservaVisita);
    when(reservaMock.getFecha()).thenReturn(new Date('2025-05-10'));
    when(reservaMock.getVisitantes()).thenReturn(4);

    const animalReal = new Animal('2', 'Mia', 'Gata', new Date('2025-01-01'), 4, 'Crítico');
    const tratamientoReal = new TratamientoVeterinario(
      'T3', animalReal, 'Revisión', new Date('2025-05-05'), 2, 25
    );

    reporte = new ReporteMensual(
      5, 2025,
      [ instance(animalStub) ],
      [ instance(reservaMock) ],
      [ tratamientoReal ]
    );

    const resumen = reporte.generarResumen();
    expect(resumen).toBe(
      `Resumen 5/2025:\n` +
      `- Animales ingresados: 1\n` +
      `- Total de visitantes: 4\n` +
      `- Animales tratados: 1`
    );
  });
});
