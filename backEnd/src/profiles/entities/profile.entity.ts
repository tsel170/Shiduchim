import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfileHobby } from './profile-hobby.entity';
import { ProfileInquiryPhone } from './profile-inquiry-phone.entity';
import { ProfileLookingForTrait } from './profile-looking-for.entity';
import { ProfilePersonality } from './profile-personality.entity';

@Entity('profiles', { schema: 'dbo' })
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255 })
  firstName: string;

  @Column({ type: 'nvarchar', length: 255 })
  lastName: string;

  @Column({ type: 'nvarchar', length: 255 })
  residence: string;

  @Column({ type: 'int' })
  heightCm: number;

  @Column({ type: 'nvarchar', length: 255 })
  stream: string;

  @Column({ type: 'nvarchar', length: 100 })
  maritalStatus: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'nvarchar', length: 'max' })
  desiredHomeDescription: string;

  @OneToMany(() => ProfilePersonality, (trait) => trait.profile, {
    cascade: true,
    eager: true,
  })
  personalityTraits: ProfilePersonality[];

  @OneToMany(() => ProfileHobby, (hobby) => hobby.profile, {
    cascade: true,
    eager: true,
  })
  hobbies: ProfileHobby[];

  @OneToMany(() => ProfileLookingForTrait, (trait) => trait.profile, {
    cascade: true,
    eager: true,
  })
  lookingForInPartner: ProfileLookingForTrait[];

  @OneToMany(() => ProfileInquiryPhone, (phone) => phone.profile, {
    cascade: true,
    eager: true,
  })
  inquiryPhones: ProfileInquiryPhone[];

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
