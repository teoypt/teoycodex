// Keep this file checked in so the app compiles before a remote project exists.
// Regenerate it with `supabase gen types typescript` after applying migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_label: string | null;
          actor_role: Database["public"]["Enums"]["app_role"] | null;
          actor_user_id: string | null;
          id: number;
          ip_address: unknown | null;
          metadata: Json;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          request_id: string | null;
          resource_id: string | null;
          resource_type: string | null;
          result: Database["public"]["Enums"]["audit_result"];
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_label?: string | null;
          actor_role?: Database["public"]["Enums"]["app_role"] | null;
          actor_user_id?: string | null;
          id?: never;
          ip_address?: unknown | null;
          metadata?: Json;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          request_id?: string | null;
          resource_id?: string | null;
          resource_type?: string | null;
          result: Database["public"]["Enums"]["audit_result"];
          user_agent?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          enabled: boolean;
          event_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          enabled?: boolean;
          event_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"];
          enabled?: boolean;
          event_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          action_url: string | null;
          attempt_count: number;
          body: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          delivered_at: string | null;
          event_name: string;
          failed_at: string | null;
          failure_code: string | null;
          id: string;
          idempotency_key: string;
          provider_message_id: string | null;
          read_at: string | null;
          recipient_user_id: string;
          scheduled_at: string;
          sent_at: string | null;
          status: Database["public"]["Enums"]["notification_status"];
          title: string;
        };
        Insert: {
          action_url?: string | null;
          attempt_count?: number;
          body: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          delivered_at?: string | null;
          event_name: string;
          failed_at?: string | null;
          failure_code?: string | null;
          id?: string;
          idempotency_key: string;
          provider_message_id?: string | null;
          read_at?: string | null;
          recipient_user_id: string;
          scheduled_at?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          title: string;
        };
        Update: { read_at?: string | null };
        Relationships: [];
      };
      product_events: {
        Row: {
          anonymous_id: string | null;
          event_name: string;
          id: number;
          occurred_at: string;
          properties: Json;
          request_id: string | null;
          schema_version: number;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          anonymous_id?: string | null;
          event_name: string;
          id?: never;
          occurred_at?: string;
          properties?: Json;
          request_id?: string | null;
          schema_version?: number;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          deactivated_at: string | null;
          deactivated_by: string | null;
          display_name: string | null;
          id: string;
          last_seen_at: string | null;
          locale: string;
          status: Database["public"]["Enums"]["account_status"];
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deactivated_at?: string | null;
          deactivated_by?: string | null;
          display_name?: string | null;
          id: string;
          last_seen_at?: string | null;
          locale?: string;
          status?: Database["public"]["Enums"]["account_status"];
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          last_seen_at?: string | null;
          locale?: string;
          timezone?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          created_at: string;
          description: string | null;
          is_public: boolean;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          is_public?: boolean;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: Json;
        };
        Update: {
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          granted_at: string;
          granted_by: string | null;
          reason: string | null;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          granted_by?: string | null;
          reason?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          granted_at?: string;
          granted_by?: string | null;
          reason?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      admin_set_account_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["account_status"];
          p_reason?: string;
          p_target_user_id: string;
        };
        Returns: undefined;
      };
      admin_set_user_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["app_role"];
          p_reason?: string;
          p_target_user_id: string;
        };
        Returns: undefined;
      };
      admin_update_setting: {
        Args: { setting_key: string; setting_value: Json };
        Returns: undefined;
      };
      mark_notification_read: {
        Args: { notification_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      account_status: "active" | "disabled" | "pending_deletion";
      app_role: "admin" | "user";
      audit_result: "success" | "failure" | "denied";
      notification_channel: "in_app" | "email";
      notification_status: "queued" | "sent" | "delivered" | "failed" | "cancelled";
    };
    CompositeTypes: Record<never, never>;
  };
};
