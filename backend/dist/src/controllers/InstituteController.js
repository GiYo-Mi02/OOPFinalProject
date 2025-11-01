"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstitutes = getInstitutes;
const supabaseClient_1 = require("../config/supabaseClient");
async function getInstitutes(_req, res) {
    try {
        if (!supabaseClient_1.supabase) {
            return res.status(500).json({ message: "Database not configured" });
        }
        const { data, error } = await supabaseClient_1.supabase
            .from("institutes")
            .select("*")
            .order("type", { ascending: true })
            .order("code", { ascending: true });
        if (error) {
            console.error("Error fetching institutes:", error);
            return res.status(500).json({ message: "Failed to fetch institutes" });
        }
        return res.status(200).json({ institutes: data || [] });
    }
    catch (error) {
        console.error("Error in getInstitutes:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
