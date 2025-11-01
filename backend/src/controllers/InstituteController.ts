import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

export async function getInstitutes(_req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ message: "Database not configured" });
    }

    const { data, error } = await supabase
      .from("institutes")
      .select("*")
      .order("type", { ascending: true })
      .order("code", { ascending: true });

    if (error) {
      console.error("Error fetching institutes:", error);
      return res.status(500).json({ message: "Failed to fetch institutes" });
    }

    return res.status(200).json({ institutes: data || [] });
  } catch (error) {
    console.error("Error in getInstitutes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
