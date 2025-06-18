import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Assignment } from './Assignment';
import { Section } from './Section';
import { TimeSlot } from '../types';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  code!: string;

  @Column()
  name!: string;

  @Column('decimal', { precision: 3, scale: 1 })
  credits!: number;

  @Column('decimal', { precision: 4, scale: 1 })
  contactHours!: number;

  @Column()
  program!: string;

  @Column()
  department!: string;

  @Column()
  semester!: string;

  @Column()
  academicYear!: string;

  @Column({ default: false })
  requiresNightSection!: boolean;

  @Column('jsonb', { nullable: true })
  preferredTimeSlots!: TimeSlot[];

  @Column({ nullable: true })
  room!: string;

  @Column({ default: 40 })
  maxStudents!: number;

  @Column({ default: 0 })
  enrolledStudents!: number;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Assignment, assignment => assignment.course)
  assignments!: Assignment[];

  @OneToMany(() => Section, section => section.course)
  sections!: Section[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}