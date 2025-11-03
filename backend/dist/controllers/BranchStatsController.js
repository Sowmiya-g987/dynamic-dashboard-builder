import mongoose from "mongoose";
/**
 * 🎯 Dynamic Schema Query Handler (always based on xField and yField)
 * Fetches data from any collection using only xField & yField
 */
export async function getDynamicData(req, res) {
    try {
        const { schemaName, xField, yField } = req.query;
        console.log("📊 [DynamicQuery] Request:", { schemaName, xField, yField });
        // Validation
        if (!schemaName || !xField || !yField) {
            return res.status(400).json({
                error: "schemaName, xField, and yField are required",
            });
        }
        // Get the collection dynamically
        const collection = mongoose.connection.db.collection(schemaName);
        // Build projection (only x and y fields)
        const projection = { _id: 0 };
        projection[xField] = 1;
        projection[yField] = 1;
        console.log("📋 [DynamicQuery] Projection:", projection);
        // Always fetch all rows — no filter applied
        const data = await collection.find({}, { projection }).toArray();
        console.log("✅ [DynamicQuery] Data fetched:", data.length, "records");
        return res.json(data);
    }
    catch (err) {
        console.error("❌ [DynamicQuery] Error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
/**
 * 🔄 Legacy endpoints (kept for backward compatibility)
 */
export async function getAllBranches(req, res) {
    try {
        const collection = mongoose.connection.db.collection("branchstats");
        const branches = await collection.find({}).toArray();
        return res.json(branches);
    }
    catch (err) {
        console.error("Error fetching all branches:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
export async function getAllEmployeeCounts(req, res) {
    try {
        const collection = mongoose.connection.db.collection("branchstats");
        const branches = await collection
            .find({}, {
            projection: { branch: 1, NofEmployee: 1, _id: 0 },
        })
            .toArray();
        return res.json(branches);
    }
    catch (err) {
        console.error("Error fetching employee counts:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
export async function getAllInternCounts(req, res) {
    try {
        const collection = mongoose.connection.db.collection("branchstats");
        const branches = await collection
            .find({}, {
            projection: { branch: 1, NofIntern: 1, _id: 0 },
        })
            .toArray();
        return res.json(branches);
    }
    catch (err) {
        console.error("Error fetching intern counts:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
export async function getBranchStats(req, res) {
    try {
        const { branch } = req.params;
        const collection = mongoose.connection.db.collection("branchstats");
        const data = await collection.findOne({ branch });
        if (!data)
            return res.status(404).json({ error: "Branch not found" });
        return res.json({
            branch: data.branch,
            NofEmployee: data.NofEmployee,
            NofIntern: data.NofIntern,
        });
    }
    catch (err) {
        console.error("Error fetching branch stats:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
export async function filterByBranchAndType(req, res) {
    try {
        const { branch, type } = req.query;
        const collection = mongoose.connection.db.collection("branchstats");
        const data = await collection.findOne({ branch });
        if (!data)
            return res.status(404).json({ error: "Branch not found" });
        if (type === "Employee") {
            return res.json({ branch: data.branch, NofEmployee: data.NofEmployee });
        }
        else if (type === "Intern") {
            return res.json({ branch: data.branch, NofIntern: data.NofIntern });
        }
        else {
            return res.json({
                branch: data.branch,
                NofEmployee: data.NofEmployee,
                NofIntern: data.NofIntern,
            });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}
//# sourceMappingURL=BranchStatsController.js.map