import { Organization } from './../../organizations/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Organization, (organization) => organization.employees, {
    eager: true,
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}