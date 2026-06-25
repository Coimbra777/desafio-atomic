import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";

import { User } from "../../modules/users/entities/user.entity";

export const SEED_PASSWORD = "Taskflow@123";
const BCRYPT_ROUNDS = 10;

export const USER_DEFS = [
  { name: "Gabriel", email: "gabriel@taskflow.dev" },
  { name: "Ana Souza", email: "ana@taskflow.dev" },
  { name: "Carlos Lima", email: "carlos@taskflow.dev" },
  { name: "Marina Costa", email: "marina@taskflow.dev" },
  { name: "João Pereira", email: "joao@taskflow.dev" },
] as const;

export async function seedUsers(
  dataSource: DataSource,
): Promise<Record<string, User>> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
  const userRepo = dataSource.getRepository(User);
  const userMap: Record<string, User> = {};

  for (const def of USER_DEFS) {
    let user = await userRepo.findOne({ where: { email: def.email } });

    if (!user) {
      user = userRepo.create({ name: def.name, email: def.email, passwordHash });
      await userRepo.save(user);
      console.log(`  [CREATED] ${def.email}`);
    } else {
      console.log(`  [SKIPPED] ${def.email} (already exists)`);
    }

    userMap[def.email] = user;
  }

  return userMap;
}
