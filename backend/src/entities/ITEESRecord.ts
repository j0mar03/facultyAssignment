import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Faculty } from './Faculty';
import { ITEESRating } from '../types';

@Entity('itees_records')
export class ITEESRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Faculty, faculty => faculty.iteesHistory)
  @JoinColumn({ name: 'facultyId' })
  faculty!: Faculty;

  @Column()
  facultyId!: string;

  @Column()
  semester!: string;

  @Column()
  academicYear!: string;

  @Column({
    type: 'enum',
    enum: ['Outstanding', 'Very Satisfactory', 'Satisfactory', 'Fair', 'Poor'],
  })
  rating!: ITEESRating;

  @Column('decimal', { precision: 3, scale: 2 })
  numericalScore!: number;

  @Column({ nullable: true })
  evaluatorCount!: number;

  @Column({ nullable: true })
  comments!: string;

  @CreateDateColumn()
  createdAt!: Date;
}