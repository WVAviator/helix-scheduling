import { User } from './../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @ManyToOne(() => User, (user) => user.shifts, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  user: User;
}
