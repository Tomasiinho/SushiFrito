import * as React from "react";
import type { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
} from "react-native";

import { colors } from "@/styles/theme";

const LOCAL_REFRESH_DURATION_MS = 450;

export type RefreshableScrollViewProps = Omit<
  ScrollViewProps,
  "refreshControl"
> & {
  onRefresh?: () => Promise<unknown> | undefined;
  refreshEnabled?: boolean;
  refreshing?: boolean;
};

export function RefreshableScrollView({
  children,
  onRefresh,
  refreshEnabled = true,
  refreshing = false,
  ...props
}: RefreshableScrollViewProps): ReactNode {
  const [localRefreshing, setLocalRefreshing] = React.useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const finishLocalRefresh = React.useCallback((): void => {
    if (isMounted.current) {
      setLocalRefreshing(false);
    }
  }, []);

  const handleRefresh = React.useCallback((): void => {
    setLocalRefreshing(true);

    const refreshTask =
      onRefresh === undefined
        ? new Promise<void>((resolve) => {
            setTimeout(resolve, LOCAL_REFRESH_DURATION_MS);
          })
        : Promise.resolve(onRefresh());

    void refreshTask.catch(() => undefined).finally(finishLocalRefresh);
  }, [finishLocalRefresh, onRefresh]);

  return (
    <ScrollView
      {...props}
      alwaysBounceVertical={props.alwaysBounceVertical ?? true}
      refreshControl={
        refreshEnabled ? (
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={handleRefresh}
            progressBackgroundColor={colors.surface}
            refreshing={refreshing || localRefreshing}
            tintColor={colors.primary}
            titleColor={colors.muted}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}
