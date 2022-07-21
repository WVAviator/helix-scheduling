import { Shift } from './../../shifts/entities/shift.entity';
import { Role } from './../../rbac/role.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: Role.USER })
  role: Role = Role.USER;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToMany(() => Shift, (shift) => shift.user, { cascade: true })
  shifts: Shift[];
}
