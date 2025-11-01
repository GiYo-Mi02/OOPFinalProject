"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstitute = updateInstitute;
const supabaseClient_1 = require("../config/supabaseClient");
async function updateInstitute(req, res) {
    try {
        const userId = req.user?.id;
        const { instituteId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!instituteId || typeof instituteId !== "string") {
            return res.status(400).json({ message: "Invalid institute ID" });
        }
        if (!supabaseClient_1.supabase) {
            return res.status(500).json({ message: "Database connection not available" });
        }
        // Verify the institute exists
        const { data: institute, error: instituteError } = await supabaseClient_1.supabase
            .from("institutes")
            .select("code")
            .eq("code", instituteId)
            .single();
        if (instituteError || !institute) {
            return res.status(400).json({ message: "Invalid institute code" });
        }
        // Update user's institute_id
        const { data: updatedUser, error: updateError } = await supabaseClient_1.supabase
            .from("users")
            .update({ institute_id: instituteId })
            .eq("id", userId)
            .select()
            .single();
        if (updateError) {
            console.error("Error updating user institute:", updateError);
            return res.status(500).json({ message: "Failed to update institute" });
        }
        return res.status(200).json({
            message: "Institute updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Error in updateInstitute:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
