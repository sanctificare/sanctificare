CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "prayer_logs_user_completed_idx" ON "prayer_logs" USING btree ("userId","completedAt");--> statement-breakpoint
CREATE INDEX "prayer_intentions_active_expires_idx" ON "prayer_intentions" USING btree ("isActive","expiresAt");--> statement-breakpoint
CREATE INDEX "intention_prayers_user_id_idx" ON "intention_prayers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "intention_prayers_intention_id_idx" ON "intention_prayers" USING btree ("intentionId");--> statement-breakpoint
CREATE UNIQUE INDEX "intention_prayers_intention_user_uq" ON "intention_prayers" USING btree ("intentionId","userId");--> statement-breakpoint
CREATE INDEX "intention_messages_intention_created_idx" ON "intention_messages" USING btree ("intentionId","createdAt");--> statement-breakpoint
CREATE INDEX "virtual_candles_expires_at_idx" ON "virtual_candles" USING btree ("expiresAt");--> statement-breakpoint
CREATE UNIQUE INDEX "candle_prayers_candle_user_uq" ON "candle_prayers" USING btree ("candleId","userId");