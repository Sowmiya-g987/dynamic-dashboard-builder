// backend/src/controllers/BranchStatsController.ts
import type { Request, Response } from "express";
import mongoose from "mongoose";


export async function getDynamicData(req: Request, res: Response) {
  try {
    const { schemaName, xField, yField } = req.query;

    console.log(" [DynamicQuery] Request:", { schemaName, xField, yField });

    if (!schemaName || !xField || !yField) {
      return res.status(400).json({
        error: "schemaName, xField, and yField are required",
      });
    }

    const collection = mongoose.connection.db.collection(schemaName as string);


    const projection: any = { _id: 0 };
    projection[xField as string] = 1;
    projection[yField as string] = 1;

    console.log(" [DynamicQuery] Projection:", projection);

   
    const data = await collection.find({}, { projection }).toArray();

    console.log("[DynamicQuery] Data fetched:", data.length, "records");

    return res.json(data);
  } catch (err) {
    console.error(" [DynamicQuery] Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}


export async function getAllBranches(req: Request, res: Response) {
  try {
    const collection = mongoose.connection.db.collection("branchstats");
    const branches = await collection.find({}).toArray();
    return res.json(branches);
  } catch (err) {
    console.error("Error fetching all branches:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getAllEmployeeCounts(req: Request, res: Response) {
  try {
    const collection = mongoose.connection.db.collection("branchstats");
    const branches = await collection
      .find({}, {
        projection: { branch: 1, NofEmployee: 1, _id: 0 },
      })
      .toArray();
    return res.json(branches);
  } catch (err) {
    console.error("Error fetching employee counts:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getAllInternCounts(req: Request, res: Response) {
  try {
    const collection = mongoose.connection.db.collection("branchstats");
    const branches = await collection
      .find({}, {
        projection: { branch: 1, NofIntern: 1, _id: 0 },
      })
      .toArray();
    return res.json(branches);
  } catch (err) {
    console.error("Error fetching intern counts:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getBranchStats(req: Request, res: Response) {
  try {
    const { branch } = req.params;
    const collection = mongoose.connection.db.collection("branchstats");
    const data = await collection.findOne({ branch });

    if (!data) return res.status(404).json({ error: "Branch not found" });

    return res.json({
      branch: data.branch,
      NofEmployee: data.NofEmployee,
      NofIntern: data.NofIntern,
    });
  } catch (err) {
    console.error("Error fetching branch stats:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function filterByBranchAndType(req: Request, res: Response) {
  try {
    const { branch, type } = req.query;
    const collection = mongoose.connection.db.collection("branchstats");
    const data = await collection.findOne({ branch });

    if (!data) return res.status(404).json({ error: "Branch not found" });

    if (type === "Employee") {
      return res.json({ branch: data.branch, NofEmployee: data.NofEmployee });
    } else if (type === "Intern") {
      return res.json({ branch: data.branch, NofIntern: data.NofIntern });
    } else {
      return res.json({
        branch: data.branch,
        NofEmployee: data.NofEmployee,
        NofIntern: data.NofIntern,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
