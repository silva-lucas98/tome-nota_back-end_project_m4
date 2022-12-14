import AppDataSource from "../../data-source";
import { Text } from "../../entities/text.entity";
import { AppError } from "../../errors/AppError";

const deleteTextService = async (id: string): Promise<void> => {
  const textRepository = AppDataSource.getRepository(Text);
  const text = await textRepository.findOneBy({ id });

  if (!text) {
    throw new AppError("Text not found", 404);
  }

  await textRepository.delete({ id });
};

export default deleteTextService;
