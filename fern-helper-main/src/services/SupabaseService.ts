import { createClient, Session } from "@supabase/supabase-js";
import { requestWithBackendFallback } from "./apiClient";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseService {
  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  static async signup(email: string, password: string, metadata: { [key: string]: any }) {
    const { data, error } = await supabase.auth.signUp(
      {
        email, password, options: {
          data: metadata
        }
      }
    );
    if (error) throw error;

    // Send user data to the "/user" endpoint
    try {
      const fullName = (metadata?.username || "").toString().trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const first_name = (metadata?.first_name || parts[0] || fullName || email.split("@")[0]).toString();
      const last_name = (metadata?.last_name || parts.slice(1).join(" ") || "").toString();

      await requestWithBackendFallback({
        method: "POST",
        url: "/user",
        data: {
        user_id: data.user?.id,
        profile_pic_url: null,
        notification_preferences: null,
        email,
        username: metadata?.username || fullName || email.split("@")[0],
        first_name,
        last_name,
        location: metadata?.location,
        },
      });
    } catch (postError) {
      console.error("Error creating user in database:", postError);
      throw postError;
    }

    return data;
  }

  static async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }
    return data.session;
  }

  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}

export default SupabaseService;
