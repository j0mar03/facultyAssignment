import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FacultyType, ITEESRating, SchedulePreference } from '../types';
import { Assignment } from './Assignment';
import { ITEESRecord } from './ITEESRecord';
import { Section } from './Section';

@Entity('faculty')
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  employeeId!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column({
    type: 'enum',
    enum: ['Regular', 'PartTime', 'Temporary', 'Designee'],
  })
  type!: FacultyType;

  @Column()
  department!: string;

  @Column()
  college!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column('jsonb', { nullable: true })
  preferences!: SchedulePreference[];

  @Column({ default: 0 })
  currentRegularLoad!: number;

  @Column({ default: 0 })
  currentExtraLoad!: number;

  @Column({ default: 0 })
  consecutiveLowRatings!: number;

  @OneToMany(() => Assignment, assignment => assignment.faculty)
  assignments!: Assignment[];

  @OneToMany(() => ITEESRecord, record => record.faculty)
  iteesHistory!: ITEESRecord[];

  @OneToMany(() => Section, section => section.faculty)
  sections!: Section[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get latestITEESRating(): ITEESRating | null {
    if (!this.iteesHistory || this.iteesHistory.length === 0) return null;
    const sorted = this.iteesHistory.sort((a, b) => 
      new Date(b.semester).getTime() - new Date(a.semester).getTime()
    );
    return sorted[0].rating;
  }
}