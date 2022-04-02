import { HelperText, InvalidExecutionError } from '../../ts';
import { FilterType } from '../../ts/Data/FilterType';

describe('Classe HelperText', () => {
  test('Não deve permitir instanciar', () => {
    // Arrange, Given
    // Act, When

    const instantiate = () => new HelperText();

    // Assert, Then

    expect(instantiate).toThrowError(InvalidExecutionError);
  });

  test('escapeRegExp deve escapar uma string para expressão regular', () => {
    // Arrange, Given

    const regexSymbols = [
      '.',
      '*',
      '+',
      '?',
      '^',
      '$',
      '{',
      '}',
      '(',
      ')',
      '|',
      '[',
      ']',
      '\\'
    ];
    const regexSymbolsEscaped = [];

    // Act, When

    for (const regexSymbol of regexSymbols) {
      regexSymbolsEscaped.push(HelperText.escapeRegExp(regexSymbol));
    }

    // Assert, Then

    expect(regexSymbols.length).toBe(regexSymbolsEscaped.length);
    for (
      let i = 0;
      i < regexSymbols.length && i < regexSymbolsEscaped.length;
      i++
    ) {
      expect(regexSymbolsEscaped[i]).not.toBe(regexSymbols[i]);
      expect(regexSymbolsEscaped[i]).toBe('\\' + regexSymbols[i]);
    }
  });

  test('replaceAll deve substituir todas as ocorrências', () => {
    // Arrange, Given

    const search = 'a';
    const replacement = 'b';
    const initialText = search.repeat(5);

    // Act, When

    const replacedText = HelperText.replaceAll(
      initialText,
      search,
      replacement
    );

    // Assert, Then

    expect(replacedText.length).toBe(initialText.length);

    const expectedText = replacement.repeat(initialText.length);
    expect(replacedText).toBe(expectedText);
  });

  describe('querystring deve fazer substituições', () => {
    test('substituir valores de um array', () => {
      // Arrange, Given

      const randomValues = [Math.random(), Math.random()];
      const inputTemplate = 'My random values are: {0}, {1}, {2}, {3}';
      const expectedOutputText = `My random values are: ${randomValues[0]}, ${randomValues[1]}, {2}, {3}`;

      // Act, When

      const output = HelperText.querystring(inputTemplate, randomValues);

      // Assert, Then

      expect(output).toBe(expectedOutputText);
    });

    test('substituir valores de um objeto', () => {
      // Arrange, Given

      const randomValues = {
        property1: Math.random(),
        property2: Math.random()
      };
      const inputTemplate =
        'My random values are: {property1}, {property2}, {property3}, {property4}';
      const expectedOutputText = `My random values are: ${randomValues.property1}, ${randomValues.property2}, {property3}, {property4}`;

      // Act, When

      const output = HelperText.querystring(inputTemplate, randomValues);

      // Assert, Then

      expect(output).toBe(expectedOutputText);
    });

    test('substituir um valor individualmente', () => {
      // Arrange, Given

      const randomValue = Math.random();
      const inputTemplate = 'My random values are: {0}, {1} e {2}';
      const expectedOutputText = `My random values are: ${randomValue}, {1} e {2}`;

      // Act, When

      const output = HelperText.querystring(inputTemplate, randomValue);

      // Assert, Then

      expect(output).toBe(expectedOutputText);
    });

    test('substituir um valor tipo Date', () => {
      // Arrange, Given

      const randomDate = new Date();
      const inputTemplate = 'My random date is: {0}, {1} e {2}';
      const expectedOutputText = `My random date is: ${randomDate}, {1} e {2}`;

      // Act, When

      const output = HelperText.querystring(inputTemplate, randomDate);

      // Assert, Then

      expect(output).toBe(expectedOutputText);
    });

    test('não deve substituir um valor indefinido ou nulo', () => {
      // Arrange, Given

      const valueAsUndefined = undefined;
      const valueAsNull = null;
      const inputTemplate = 'My empty value is: {0}';

      // Act, When

      const outputForUndefined = HelperText.querystring(
        inputTemplate,
        valueAsUndefined
      );
      const outputForNull = HelperText.querystring(inputTemplate, valueAsNull);

      // Assert, Then

      expect(outputForUndefined).toBe(inputTemplate);
      expect(outputForNull).toBe(inputTemplate);
    });
  });
  describe('getCommandArguments() deve separar comandos em lista', () => {
    test('comandos separados por espaços simples', () => {
      // Arrange, Given

      const commandLine = 'arg1 arg2 arg3';

      // Act, When

      const args = HelperText.getCommandArguments(commandLine);

      // Assert, Then

      expect(args).toEqual(['arg1', 'arg2', 'arg3']);
    });
    test('comandos separados por espaços com aspas simples', () => {
      // Arrange, Given

      const commandLine = "arg1 'arg2a arg2b arg2c' arg3";

      // Act, When

      const args = HelperText.getCommandArguments(commandLine);

      // Assert, Then

      expect(args).toEqual(['arg1', 'arg2a arg2b arg2c', 'arg3']);
    });
    test('comandos separados por espaços com aspas duplas', () => {
      // Arrange, Given

      const commandLine = 'arg1 "arg2a arg2b arg2c" arg3';

      // Act, When

      const args = HelperText.getCommandArguments(commandLine);

      // Assert, Then

      expect(args).toEqual(['arg1', 'arg2a arg2b arg2c', 'arg3']);
    });
    test('comandos separados com aspas atravessadas (errada)', () => {
      // Arrange, Given

      const commandLine = "arg1 \"arg2a arg2b arg2c' arg3 'arg4";

      // Act, When

      const args = HelperText.getCommandArguments(commandLine);

      // Assert, Then

      expect(args).toEqual([
        'arg1',
        '"arg2a',
        'arg2b',
        "arg2c'",
        'arg3',
        "'arg4"
      ]);
    });
  });

  test('removeAccents deve remover acentos', () => {
    // Arrange, Given

    const input = 'Um, dois, três: Ação!';
    const expectedOutput = 'Um, dois, tres: Acao!';

    // Act, When

    const output = HelperText.removeAccents(input);

    // Assert, Then

    expect(output).toBe(expectedOutput);
  });
  test('slugify deve converter texto em slug', () => {
    // Arrange, Given

    const input = '  Um, dois, três:   ---   [Ação]!  ';
    const expectedOutput = 'um-dois-tres-acao';

    // Act, When

    const output = HelperText.slugify(input);

    // Assert, Then

    expect(output).toBe(expectedOutput);
  });
  describe('matchFilter', () => {
    test('filtro com base em string', () => {
      // Arrange, Given

      const textMatch = Math.random().toString();
      const textNotMatch = Math.random().toString();
      const filter: FilterType = textMatch;

      // Act, When

      const resultForMatch = HelperText.matchFilter(textMatch, filter);
      const resultForNotMatch = HelperText.matchFilter(textNotMatch, filter);

      // Assert, Then

      expect(resultForMatch).toBe(true);
      expect(resultForNotMatch).toBe(false);
    });
    test('filtro com base em RegExp', () => {
      // Arrange, Given

      const textMatch = Math.random().toString();
      const textMatchToo = `qualquer ${textMatch} coisa`;
      const textNotMatch = Math.random().toString();
      const filter: FilterType = new RegExp(HelperText.escapeRegExp(textMatch));

      // Act, When

      const resultForMatch = HelperText.matchFilter(textMatch, filter);
      const resultForMatchToo = HelperText.matchFilter(textMatchToo, filter);
      const resultForNotMatch = HelperText.matchFilter(textNotMatch, filter);

      // Assert, Then

      expect(resultForMatch).toBe(true);
      expect(resultForMatchToo).toBe(true);
      expect(resultForNotMatch).toBe(false);
    });
    test('filtro com base em lista mista de String e RegExp', () => {
      // Arrange, Given

      const textMatch1 = Math.random().toString();
      const textMatch2 = Math.random().toString();
      const textNotMatch = Math.random().toString();
      const filter: FilterType = [
        textMatch1,
        new RegExp(`^${HelperText.escapeRegExp(textMatch2)}$`)
      ];

      // Act, When

      const resultForMatch1 = HelperText.matchFilter(textMatch1, filter);
      const resultForMatch2 = HelperText.matchFilter(textMatch2, filter);
      const resultForNotMatch = HelperText.matchFilter(textNotMatch, filter);

      // Assert, Then

      expect(resultForMatch1).toBe(true);
      expect(resultForMatch2).toBe(true);
      expect(resultForNotMatch).toBe(false);
    });
  });
});
