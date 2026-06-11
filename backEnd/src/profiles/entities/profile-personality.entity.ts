import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_personalities', { schema: 'dbo' })
export class ProfilePersonality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  profileId: string;

  @Column({ type: 'nvarchar', length: 255 })
  value: string;

  @ManyToOne(() => Profile, (profile) => profile.personalityTraits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;
}
