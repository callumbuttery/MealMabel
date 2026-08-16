export type AnalyticsEventName =
  | 'onboarding_completed'
  | 'plan_generated'
  | 'meal_swapped'
  | 'plan_modified'
  | 'shopping_item_checked'
  | 'retailer_compared';

export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProperties = Readonly<Record<string, AnalyticsValue>>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties: AnalyticsProperties;
  timestamp: string;
}

export interface Analytics {
  track(
    name: AnalyticsEventName,
    properties?: AnalyticsProperties,
  ): Promise<void>;
}

export type AnalyticsLogSink = (event: AnalyticsEvent) => void;

export class AnalyticsLogger implements Analytics {
  public constructor(
    private readonly sink: AnalyticsLogSink = (event) => {
      console.info('[MealMabel analytics]', event);
    },
  ) {}

  public async track(
    name: AnalyticsEventName,
    properties: AnalyticsProperties = {},
  ): Promise<void> {
    this.sink({
      name,
      properties,
      timestamp: new Date().toISOString(),
    });
  }
}

export class InMemoryAnalytics implements Analytics {
  public readonly events: AnalyticsEvent[] = [];

  public async track(
    name: AnalyticsEventName,
    properties: AnalyticsProperties = {},
  ): Promise<void> {
    this.events.push({
      name,
      properties,
      timestamp: new Date().toISOString(),
    });
  }

  public clear(): void {
    this.events.length = 0;
  }
}
