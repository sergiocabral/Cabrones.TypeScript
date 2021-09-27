import { InvalidExecutionError } from '../Error/InvalidExecutionError';

/**
 * Utilitários para objetos, classes, etc.
 */
export class HelperObject {
  /**
   * Construtor proibido.
   */
  public constructor() {
    throw new InvalidExecutionError('This is a static class.');
  }

  /**
   * Exibição de um nome composto.
   * @param name
   * @private
   */
  private static compositeName(name: string): string {
    const regexIsComposite = /\W/;
    return regexIsComposite.test(name) ? `"${name}"` : name;
  }

  /**
   * Verifica se uma variável é uma função.
   * @param variable Variável.
   */
  public static isFunction(variable: unknown): boolean {
    return (
      Boolean(variable) && {}.toString.call(variable) === '[object Function]'
    );
  }

  /**
   * Retorna um nome identificador do tipo de uma instância.
   * @param instance Instância.
   * @returns Nome.
   */
  public static getName(instance: unknown): string {
    if (typeof instance === 'object' && instance !== null) {
      return instance.constructor.name;
    } else if (typeof instance === 'function') {
      return instance.name;
    }
    return String(instance);
  }

  /**
   * Mesmo que eval.
   * @param code Código a ser avaliado.
   */
  public static eval(code: string): unknown {
    const eval2 = eval;
    return eval2(code);
  }

  /**
   * Converte qualquer objeto em string
   * @param instance Instância.
   * @param space Espaçamento da identação.
   */
  public static toText(
    instance: unknown,
    space: undefined | string | number = '  '
  ): string {
    const objects: unknown[] = [];

    const replacer = (key: string, value: unknown): unknown => {
      if (typeof value === 'object' && value !== null) {
        if (objects.findIndex(object => object === value) >= 0) {
          return {}.toString();
        }
        objects.push(value);
      }
      return value;
    };

    return JSON.stringify(instance, replacer, space);
  }

  /**
   * Para carregar uma única vez a lista de membros do tipo Object.
   * Usado com getMembers() quando ignoreObjectMembers=true
   * @private
   */
  private static objectMembersValue: Map<string, [string, string]> | undefined =
    undefined;

  /**
   * Para carregar uma única vez a lista de membros do tipo Object.
   * Usado com getMembers() quando ignoreObjectMembers=true
   * @private
   */
  private static get objectMembers(): Map<string, [string, string]> {
    if (this.objectMembersValue === undefined) {
      this.objectMembersValue = this.getMembers({}, true, true);
    }
    return this.objectMembersValue;
  }

  /**
   * Retorna a lista de membros (propriedades e funções) de uma instância e seu respectivo tipo.
   * @param instance
   * @param deep Navega até o último nível da herança.
   * @param includeObjectMembers Inclui os membros presentes no tipo base Object.
   */
  public static getMembers(
    instance: unknown,
    deep = true,
    includeObjectMembers = true
  ): Map<string, [string, string]> {
    const members = new Map<string, [string, string]>();
    let current = instance as Record<string, unknown>;
    do {
      Object.getOwnPropertyNames(current).forEach(member => {
        if (includeObjectMembers || !this.objectMembers.has(member)) {
          let read = false;
          let value: unknown;
          try {
            if (current.__lookupGetter__) {
              const getter = (
                current.__lookupGetter__ as (
                  propertyName: string
                ) => undefined | (() => unknown)
              )(member);
              if (typeof getter === 'function') {
                value = getter.bind(instance)();
                read = true;
              }
            }
            if (!read) {
              value = current[member];
            }
          } catch (e) {
            value = e;
          }
          const type = typeof value;
          const constructor =
            value === null
              ? 'null'
              : value === undefined
              ? 'undefined'
              : type === 'function'
              ? (value as () => void).name
              : typeof (value as HelperObject).constructor === 'function'
              ? (value as HelperObject).constructor.name
              : '';
          members.set(member, [type, constructor]);
        }
      });
      if (!deep) break;
    } while (
      (current = Object.getPrototypeOf(current) as Record<string, unknown>)
    );
    return members;
  }

  /**
   * Obtém a assinatura de uma função
   * @param func Referência para a função.
   */
  public static getFunctionSignature(func: unknown): string {
    if (!this.isFunction(func)) return '';
    const asText = String(func);
    const regexFunctionSignature = /[^(\s]*\([^)]*\)/;
    let signature = Array<string>().concat(
      regexFunctionSignature.exec(asText) as RegExpExecArray
    )[0];
    const nativeCode = '[native code]';
    if (asText.includes(nativeCode)) {
      const regexArguments = /\([^)]*\)/;
      signature = signature.replace(regexArguments, `(/* ${nativeCode} */)`);
    }
    return signature;
  }

  /**
   * Descreve um objeto com suas propriedades e métodos.
   * @param instance
   * @param deep Navega até o último nível da herança.
   * @param includeObjectMembers Inclui os membros presentes no tipo base Object.
   * @param filter Função para filtrar membros que serão listados.
   */
  public static describe(
    instance: unknown,
    deep = true,
    includeObjectMembers = true,
    filter?: (name: string, type: string) => boolean
  ): string {
    const members = this.getMembers(instance, deep, includeObjectMembers);
    const properties = Array<string>();
    const methods = Array<string>();

    for (const member of members) {
      const name = member[0];
      const type = member[1][0];
      const constructor = member[1][1];

      if (filter && !filter(name, type)) continue;

      if (type === 'function') {
        const func = (instance as Record<string, unknown>)[name];
        let signature = this.getFunctionSignature(func);
        const regexFunctionName = /^[^(]*/;
        signature = signature.replace(
          regexFunctionName,
          this.compositeName(name)
        );
        methods.push(signature);
      } else {
        properties.push(
          `${this.compositeName(name)} : ${
            type.toLowerCase() === constructor.toLowerCase() ||
            constructor === ''
              ? type
              : type + ', ' + constructor
          }`
        );
      }
    }

    properties.sort();
    methods.sort();

    const result = Array<string>();
    const addSection = (name: string, items: string[]): void => {
      result.push(name + (items.length ? ':' : ': none listed'));
      if (items.length > 0) {
        result.push(...items.map(property => `- ${property}`));
      }
    };
    addSection('Properties', properties);
    addSection('Methods', methods);

    return result.join('\n');
  }

  /**
   * Define um valor de propriedade em uma instância.
   * @param instance Instância.
   * @param name Nome da propriedade.
   * @param value Valor da propriedade.
   */
  public static setProperty<
    TValue,
    TInstance,
    TProperty extends string | number | symbol
  >(instance: TInstance, name: TProperty, value: TValue): TInstance {
    const instanceAsRecord = instance as unknown as Record<TProperty, TValue>;
    instanceAsRecord[name] = value;
    return instance;
  }

  /**
   * Define um valor de propriedade em uma instância.
   * @param instance Instância.
   * @param name Nome da propriedade.
   */
  public static getProperty<
    TValue,
    TInstance,
    TProperty extends string | number | symbol
  >(instance: TInstance, name: TProperty): TValue | undefined {
    const instanceAsRecord = instance as unknown as Record<TProperty, TValue>;
    return instanceAsRecord[name];
  }
}
