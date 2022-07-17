import { Profile } from './../../profile/entities/profile.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @ManyToOne(() => Organization, (organization) => organization.users, {
    eager: true,
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
