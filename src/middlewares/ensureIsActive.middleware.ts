import { AppError } from "../errors/AppError";
import { Request, Response, NextFunction } from 'express';
import AppDataSource from "../data-source";
import { User } from "../entities/user.entity";

const ensureIsActiveMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const {id} = req.user;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({id});

    if(!user?.isActive){
        throw new AppError("User not found", 404);
    }

    return next();
}

export default ensureIsActiveMiddleware;