export default class Utils {
  /** Ventana por defecto: últimos 30 días. */
  public static defaultWindow(): { since: Date; until: Date } {
    const until = new Date();
    const since = new Date(until.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { since, until };
  }
}
