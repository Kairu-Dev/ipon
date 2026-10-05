"use client";

import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Ensures a matching Convex `users` record exists for the authenticated Clerk user
 * before any user-scoped queries (goals, transactions, budgets) execute.
 */
export function useEnsureUser() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const ensureUserMutation = useMutation(api.users.ensureUser);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isEnsuring, setIsEnsuring] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading || syncedRef.current) {
      return;
    }

    let isMounted = true;
    syncedRef.current = true;
    setIsEnsuring(true);

    ensureUserMutation()
      .then((id) => {
        if (isMounted) {
          setUserId(id);
          setIsEnsuring(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsEnsuring(false);
          syncedRef.current = false; // allow retry on failure
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, ensureUserMutation]);

  const isReady = isAuthenticated && !isAuthLoading && userId !== null;

  return {
    isReady,
    userId,
    isLoading: isAuthLoading || isEnsuring,
    error,
  };
}
