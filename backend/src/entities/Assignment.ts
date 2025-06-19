import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Faculty } from './Faculty';
import { Course } from './Course';
import { Section } from './Section';
import { LoadType, AssignmentStatus, TimeSlot } from '../types';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Faculty, faculty => faculty.assignments)
  @JoinColumn({ name: 'facultyId' })
  faculty!: Faculty;

  @Column()
  facultyId!: string;

  @ManyToOne(() => Course, course => course.assignments)
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column()
  courseId!: string;

  @Column({
    type: 'enum',
    enum: ['Regular', 'Extra', 'OJT', 'Seminar'],
  })
  type!: LoadType;

  @Column({
    type: 'enum',
    enum: ['Proposed', 'Approved', 'Active', 'Completed'],
    default: 'Proposed',
  })
  status!: AssignmentStatus;

  @Column('jsonb')
  timeSlot!: TimeSlot;

  @Column()
  semester!: string;

  @Column()
  academicYear!: string;

  @Column({ nullable: true })
  section!: string;

  @Column({ nullable: true })
  sectionId?: string;

  @ManyToOne(() => Section, section => section.assignments, { nullable: true })
  @JoinColumn({ name: 'sectionId' })
  sectionEntity?: Section;

  @Column({ nullable: true })
  room!: string;

  @Column('decimal', { precision: 4, scale: 1 })
  creditHours!: number;

  @Column('decimal', { precision: 4, scale: 1 })
  contactHours!: number;

  @Column('decimal', { precision: 3, scale: 1, default: 0 })
  lectureHours!: number;

  @Column('decimal', { precision: 3, scale: 1, default: 0 })
  laboratoryHours!: number;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ nullable: true })
  approvedAt!: Date;

  @Column({ nullable: true })
  notes!: string;

  @Column({ default: false })
  isSubstitution!: boolean;

  @Column({ nullable: true })
  originalFacultyId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}