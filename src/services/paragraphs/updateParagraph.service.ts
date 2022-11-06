import AppDataSource from "../../data-source";
import { Paragraph } from "../../entities/paragraph.entity";
import { AppError } from "../../errors/AppError";
import { IParagraph } from "../../interfaces/paragraphs.interface";

const updateParagraphService = async (id: string, description: string): Promise<IParagraph> => {
  const paragraphRepository = AppDataSource.getRepository(Paragraph);
  const paragraph = await paragraphRepository.findOneBy({ id });

  if (!paragraph) {
    throw new AppError("Paragraph not found", 404);
  }

  await paragraphRepository.update(id, {
    description
  });

  const updatedParagraph = await paragraphRepository.findOne({
    where: {
      id
    },
    relations: {
      text: true
    }
  });

  return updatedParagraph!;
};

export default updateParagraphService;