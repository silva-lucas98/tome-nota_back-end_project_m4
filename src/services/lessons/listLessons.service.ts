import AppDataSource from "../../data-source";
import { Lesson } from "../../entities/lesson.entity";
import { StudyTopic } from "../../entities/studyTopic.entity";
import { AppError } from "../../errors/AppError";

const listLessonsService = async (id: string) => {
  const lessonRepository = AppDataSource.getRepository(Lesson);
  const studyTopicRepository= AppDataSource.getRepository(StudyTopic);

  const findStudyTopic = await studyTopicRepository.findOneBy({
    id
  });

  if(!findStudyTopic){
    throw new AppError("Study topic not found", 404);
  }

  const lessons = await lessonRepository.find({
    where: {
      studyTopic: {
        id: findStudyTopic.id
      }
    }
  });


  /*   if(studyTopicId.length == 0){
    throw new AppError("Id not found", 404);

  } */

  return lessons;

};

export default listLessonsService;