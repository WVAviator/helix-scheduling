import { Employee } from '../../employee/entities/employee.entity';

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => Employee, (employee) => employee.organization, {
    onDelete: 'CASCADE',
  })
  employees: Employee[];
}
