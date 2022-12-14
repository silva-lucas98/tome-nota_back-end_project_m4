import AppDataSource from "../../data-source";
import { Paragraph } from "../../entities/paragraph.entity";
import { AppError } from "../../errors/AppError";

const deleteParagraphService = async (id: string): Promise<void> => {
  const paragraphRepository = AppDataSource.getRepository(Paragraph);
  const paragraph = await paragraphRepository.findOneBy({ id });

  if (!paragraph) {
    throw new AppError("Paragraph not found", 404);
  }

  await paragraphRepository.delete({ id });
};

export default deleteParagraphService;
