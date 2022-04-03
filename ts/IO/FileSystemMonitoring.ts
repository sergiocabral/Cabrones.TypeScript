import { InvalidArgumentError } from '../Error/InvalidArgumentError';
import { ResultEvent } from '../Type/ResultEvent';
import { IFileSystemFields } from './IFileSystemFields';
import { FileSystemFields } from './FileSystemFields';
import { IFileSystemMonitoringEventData } from './IFileSystemMonitoringEventData';

/**
 * Monitoramento de arquivo ou diretório em disco.
 */
export class FileSystemMonitoring {
  /**
   * Construtor.
   * @param path Caminho.
   * @param interval Intervalo entre cada verificação.
   * @param getStarted Já começa o monitoramento após instanciar.
   */
  public constructor(
    public readonly path: string,
    interval: number,
    getStarted = true
  ) {
    this.interval = interval;
    if (getStarted) {
      this.start();
    }
  }

  /**
   * Controle de timeout.
   */
  private lastTimeout?: NodeJS.Timeout;

  /**
   * Intervalo entre cada verificação
   */
  private intervalValue = 1000;

  /**
   * Intervalo entre cada verificação
   */
  public get interval(): number {
    return this.intervalValue;
  }

  /**
   * Intervalo entre cada verificação
   */
  public set interval(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new InvalidArgumentError('Interval must be greater than zero.');
    }
    this.stop();
    this.intervalValue = value;
    this.start();
  }

  /**
   * Últimos dados de verificação.
   */
  public lastFieldsValue: Partial<IFileSystemFields> = new FileSystemFields();

  /**
   * Últimos dados de verificação.
   */
  public get lastFields(): IFileSystemFields | undefined {
    return this.lastFieldsValue !== undefined
      ? (JSON.parse(JSON.stringify(this.lastFieldsValue)) as IFileSystemFields)
      : undefined;
  }

  /**
   * Sinaliza monitoramento ativo
   */
  private isActiveValue = false;

  /**
   * Sinaliza monitoramento ativo.
   */
  public get isActive(): boolean {
    return this.isActiveValue;
  }

  /**
   * Inicia o monitoramento.
   */
  public start(): void {
    if (this.isActiveValue) {
      return;
    }

    this.isActiveValue = true;
    const monitoring = () => {
      this.verify();
      if (this.isActiveValue) {
        setTimeout(monitoring, this.interval);
      }
    };
    monitoring();
  }

  /**
   * Interrompe o monitoramento.
   */
  public stop(): void {
    this.isActiveValue = false;
    if (this.lastTimeout !== undefined) {
      clearTimeout(this.lastTimeout);
      this.lastTimeout = undefined;
    }
  }

  /**
   * Limpa todas as inscrições em todos os eventos.
   */
  public clearListeners(): void {
    this.onCreated.clear();
    this.onDeleted.clear();
  }

  /**
   * Quando criado.
   */
  public onCreated: Set<ResultEvent<IFileSystemMonitoringEventData>> = new Set<
    ResultEvent<IFileSystemMonitoringEventData>
  >();

  /**
   * Quando apagado.
   */
  public onDeleted: Set<ResultEvent<IFileSystemMonitoringEventData>> = new Set<
    ResultEvent<IFileSystemMonitoringEventData>
  >();

  /**
   * Realiza a verificação do arquivo.
   */
  private verify(): void {
    const currentFields = new FileSystemFields(this.path);
    const diff = currentFields.diff(this.lastFieldsValue);
    if (diff.length > 0) {
      if (diff.includes('exists')) {
        if (currentFields.exists) {
          this.trigger(this.onCreated, this.lastFieldsValue, currentFields);
        } else {
          this.trigger(this.onDeleted, this.lastFieldsValue, currentFields);
        }
      }
      this.lastFieldsValue = currentFields;
    }
  }

  /**
   * Sinaliza o evento em uma listas
   */
  private trigger(
    listeners: Set<ResultEvent<IFileSystemMonitoringEventData>>,
    before: Partial<IFileSystemFields>,
    after: Partial<IFileSystemFields>
  ): void {
    for (const listener of listeners) {
      listener(true, {
        instance: this,
        before,
        after
      });
    }
  }
}
