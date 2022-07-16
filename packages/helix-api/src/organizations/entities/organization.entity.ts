import { User } from '../../users/entities/user.entity';

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => User, (user) => user.organization, {
    onDelete: 'CASCADE',
  })
  users: User[];
}
