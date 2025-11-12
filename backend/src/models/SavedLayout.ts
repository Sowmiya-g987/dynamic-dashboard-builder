// backend/src/models/SavedLayout.ts

import { DataTypes, Model, Optional } from "sequelize";
import { layoutSequelize } from "../services/DatabaseManager.js";

interface SavedLayoutAttributes {
  id: number;
  layoutName: string;
  widgets: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SavedLayoutCreationAttributes 
  extends Optional<SavedLayoutAttributes, "id" | "createdAt" | "updatedAt"> {}

export class SavedLayout extends Model<
  SavedLayoutAttributes,
  SavedLayoutCreationAttributes
> implements SavedLayoutAttributes {

  declare id: number;
  declare layoutName: string;
  declare widgets: any;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export const initSavedLayoutModel = () => {
  SavedLayout.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      layoutName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      widgets: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize: layoutSequelize,
      tableName: "saved_layouts",
      timestamps: true,
      indexes: [
        {
          fields: ["layoutName"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  console.log("✅ [SavedLayout Model] Initialized successfully");
};

export default SavedLayout;