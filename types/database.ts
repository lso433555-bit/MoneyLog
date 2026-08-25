// supabase/migrations/0001_initial_schema.sql 스키마 기준으로 작성.
// 이후 스키마가 바뀌면 `supabase gen types typescript --project-id <ref>`로 재생성해서 교체할 것.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TransactionType = "income" | "expense";
export type AssetType = "loan" | "savings";

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          display_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          display_name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          household_id: string | null;
          name: string;
          icon: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id?: string | null;
          name: string;
          icon: string;
          color: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_templates: {
        Row: {
          id: string;
          household_id: string;
          category_id: string | null;
          type: TransactionType;
          name: string;
          amount: number;
          day_of_month: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          category_id?: string | null;
          type: TransactionType;
          name: string;
          amount: number;
          day_of_month: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          category_id?: string | null;
          type?: TransactionType;
          name?: string;
          amount?: number;
          day_of_month?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_templates_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recurring_templates_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          type: TransactionType;
          category_id: string | null;
          amount: number;
          is_fixed: boolean;
          memo: string | null;
          date: string;
          payment_method: string | null;
          recurring_template_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          type: TransactionType;
          category_id?: string | null;
          amount: number;
          is_fixed?: boolean;
          memo?: string | null;
          date?: string;
          payment_method?: string | null;
          recurring_template_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          type?: TransactionType;
          category_id?: string | null;
          amount?: number;
          is_fixed?: boolean;
          memo?: string | null;
          date?: string;
          payment_method?: string | null;
          recurring_template_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_recurring_template_id_fkey";
            columns: ["recurring_template_id"];
            referencedRelation: "recurring_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          id: string;
          household_id: string;
          category_id: string;
          month: string;
          amount_limit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          category_id: string;
          month: string;
          amount_limit: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          category_id?: string;
          month?: string;
          amount_limit?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budgets_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          type: AssetType;
          target_amount: number;
          current_amount: number;
          monthly_amount: number;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          type: AssetType;
          target_amount: number;
          current_amount?: number;
          monthly_amount?: number;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          name?: string;
          type?: AssetType;
          target_amount?: number;
          current_amount?: number;
          monthly_amount?: number;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      allowed_emails: {
        Row: {
          email: string;
          created_at: string;
        };
        Insert: {
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_household_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      transaction_type: TransactionType;
      asset_type: AssetType;
    };
    CompositeTypes: Record<string, never>;
  };
}

// 편의용 타입 별칭
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];

export type Household = Tables<"households">;
export type HouseholdMember = Tables<"household_members">;
export type Category = Tables<"categories">;
export type RecurringTemplate = Tables<"recurring_templates">;
export type Transaction = Tables<"transactions">;
export type Budget = Tables<"budgets">;
export type Asset = Tables<"assets">;
