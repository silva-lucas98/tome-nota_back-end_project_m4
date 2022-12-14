import app from "../../app";
import request from "supertest";
import { DataSource } from "typeorm";
import AppDataSource from "../../data-source";
import {
  userMock,
  studyTopicMock,
  timeLineMock,
  lessonMock,
  videoMock,
  userLoginMock,
  timeLineWithoutDescriptionMock,
  timeLineWithoutTimeMock,
  timeLineUpdateMock,
} from "../mocks";

describe("/timeline", () => {
  let connection: DataSource;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => {
        connection = res;
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });

    await request(app).post("/users").send(userMock);

    const loginResponse = await request(app).post("/login").send(userLoginMock);

    await request(app)
      .post("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(studyTopicMock);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  test("POST /timeline - Should be able to create a timeLine", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const response = await request(app)
      .post(`/timeline/${videoResponse.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineMock);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("time");
    expect(response.body).toHaveProperty("video");
  });

  test("POST /timeline - Should not be able to create timeline without authentication", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const response = await request(app)
      .post(`/timeline/${videoResponse.body.id}`)
      .send(timeLineMock);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Missing authorization headers");
    expect(response.status).toBe(401);
  });

  test("POST /timeline - Should not be able to create timeline with invalid id", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const response = await request(app)
      .post("/timeline/ce381027-d5b3-463a-bdea-c92884c8e362")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineMock);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Video not found");
    expect(response.status).toBe(404);
  });

  test("POST/timeline - Should not be able to create a timeline without description field value", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const response = await request(app)
      .post(`/timeline/${videoResponse.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineWithoutDescriptionMock);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe(
      "Time and description are required fields"
    );
  });

  test("POST/timeline - Should not be able to create a timeline without time field value", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const response = await request(app)
      .post(`/timeline/${videoResponse.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineWithoutTimeMock);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe(
      "Time and description are required fields"
    );
  });

  test("GET/timeline - Should be able to list timelines", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    await request(app)
      .post(`/timeline/${videoResponse.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineMock);

    const response = await request(app)
      .get(`/timeline/${videoResponse.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("GET /timeline - Should not be able to list timeline without authentication", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const response = await request(app).get(
      `/timeline/${videoResponse.body.id}`
    );

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Missing authorization headers");
    expect(response.status).toBe(401);
  });

  test("GET/timeline - Should not be able to list timelines with id invalid", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const response = await request(app)
      .get("/timeline/b240b1a2-23a1-4540-a333-ccbd54fcbaeb")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Video not found");
  });

  test("PATCH /timeline/:id - Should be able to update timeline", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const responseTimeline = await request(app)
      .post(`/timeline/${videoResponse.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineMock);

    const response = await request(app)
      .patch(`/timeline/${responseTimeline.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineUpdateMock);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("time");
    expect(response.body).toHaveProperty("video");
  });

  test("PATCH /timeline - Should not be able to update timeline without authentication", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const response = await request(app)
      .patch(`/timeline/${videoResponse.body.id}`)
      .send(timeLineUpdateMock);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Missing authorization headers");
    expect(response.status).toBe(401);
  });

  test("PATCH /timeline/:id - Should not be able to update timeline with invalid id", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const response = await request(app)
      .patch("/timeline/b240b1a2-23a1-4540-a333-ccbd54fcbaeb")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineUpdateMock);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Chapter not found");
  });

  test("DELETE /timeline/:id - Should be able to delete timeline", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const responseTimeline = await request(app)
      .post(`/timeline/${videoResponse.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineMock);

    const response = await request(app)
      .delete(`/timeline/${responseTimeline.body.id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(204);
  });

  test("DELETE /timeline/:id - Should not be able to delete timeline with invalid id", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const response = await request(app)
      .delete("/timeline/b240b1a2-23a1-4540-a333-ccbd54fcbaeb")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(timeLineUpdateMock);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Chapter not found");
  });

  test("DELETE /timeline - Should not be able to update delete without authentication", async () => {
    const loginResponse = await request(app).post("/login").send(userLoginMock);

    const studyTopicList = await request(app)
      .get("/study-topics")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    await request(app)
      .post(`/lesson/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(lessonMock);

    const lessonList = await request(app)
      .get(`/lesson/study-topic/${studyTopicList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    const videoResponse = await request(app)
      .post(`/video/${lessonList.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(videoMock);

    const response = await request(app).delete(
      `/timeline/${videoResponse.body.id}`
    );

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Missing authorization headers");
    expect(response.status).toBe(401);
  });
});
