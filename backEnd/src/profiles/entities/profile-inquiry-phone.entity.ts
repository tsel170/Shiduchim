import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_inquiry_phones', { schema: 'dbo' })
export class ProfileInquiryPhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  profileId: string;

  @Column({ type: 'nvarchar', length: 255 })
  contactName: string;

  @Column({ type: 'nvarchar', length: 10 })
  phonePrefix: string;

  @Column({ type: 'nvarchar', length: 20 })
  phoneNumber: string;

  @ManyToOne(() => Profile, (profile) => profile.inquiryPhones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;
}
