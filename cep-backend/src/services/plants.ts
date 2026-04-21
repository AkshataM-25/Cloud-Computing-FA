import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db/mysql.js";

export interface Plant {
  plant_id?: number;
  user_id: string;
  plant_name: string;
  nickname?: string;
  plant_type: string;
  species: string;
  image_url: string;
  location_in_home: string;
  pot_size: string;
  acquisition_date?: string;
  last_watered: string;
  sunlight_exposure: string;
  soil_type?: string;
  health_status: string;
  care_recommendations?: string | Record<string, unknown>;
  created_at?: string;
}

class PlantService {
  async getUserPlants(user_id: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    return rows;
  }

  async getPlantById(plant_id: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM plants WHERE plant_id = ? LIMIT 1",
      [plant_id]
    );

    return rows[0] || null;
  }

  async createPlant(plantData: Plant) {
    const careRecommendations =
      typeof plantData.care_recommendations === "object"
        ? JSON.stringify(plantData.care_recommendations)
        : plantData.care_recommendations || null;

    const [insertResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO plants (
        user_id,
        plant_name,
        nickname,
        plant_type,
        species,
        image_url,
        location_in_home,
        pot_size,
        acquisition_date,
        last_watered,
        sunlight_exposure,
        soil_type,
        health_status,
        care_recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plantData.user_id,
        plantData.plant_name,
        plantData.nickname || null,
        plantData.plant_type,
        plantData.species,
        plantData.image_url,
        plantData.location_in_home,
        plantData.pot_size,
        plantData.acquisition_date || null,
        plantData.last_watered,
        plantData.sunlight_exposure,
        plantData.soil_type || null,
        plantData.health_status,
        careRecommendations,
      ]
    );

    const [createdRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM plants WHERE plant_id = ? LIMIT 1",
      [insertResult.insertId]
    );

    return createdRows[0] || { plant_id: insertResult.insertId, ...plantData };
  }

  async updateCareRecommendations(plantId: string, careRecommendations: string | Record<string, unknown>) {
    const recommendationsToStore =
      typeof careRecommendations === "object"
        ? JSON.stringify(careRecommendations)
        : careRecommendations;

    await pool.execute(
      "UPDATE plants SET care_recommendations = ? WHERE plant_id = ?",
      [recommendationsToStore, plantId]
    );

    return this.getPlantById(plantId);
  }
}

export default PlantService;