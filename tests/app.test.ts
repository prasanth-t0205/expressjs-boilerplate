import request from "supertest";
import app from "@/app";

describe("App Integration Tests", () => {
  describe("GET /health", () => {
    it("should return 200 OK and status healthy", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe("healthy");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("Unknown Routes", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app).get("/api/unknown-route-123");
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Requested endpoint not found.");
    });
  });
});
