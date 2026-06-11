import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_looking_for_traits', { schema: 'dbo' })
export class ProfileLookingForTrait {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  profileId: string;

  @Column({ type: 'nvarchar', length: 255 })
  value: string;

  @ManyToOne(() => Profile, (profile) => profile.lookingForInPartner, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;
}
