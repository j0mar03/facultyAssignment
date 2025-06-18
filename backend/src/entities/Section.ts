import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './Course';
import { Faculty } from './Faculty';
import { Assignment } from './Assignment';

export type SectionStatus = 'Planning' | 'Assigned' | 'Active' | 'Completed' | 'Cancelled';
export type ClassType = 'Regular' | 'Laboratory' | 'Lecture' | 'Combined';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sectionCode!: string; // e.g., "DCPET 1-1", "DCPET 1-2"

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, course => course.sections)
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column({ nullable: true })
  facultyId?: string;

  @ManyToOne(() => Faculty, faculty => faculty.sections, { nullable: true })
  @JoinColumn({ name: 'facultyId' })
  faculty?: Faculty;

  @OneToMany(() => Assignment, assignment => assignment.sectionEntity)
  assignments!: Assignment[];

  @Column({
    type: 'enum',
    enum: ['Planning', 'Assigned', 'Active', 'Completed', 'Cancelled'],
    default: 'Planning'
  })
  status!: SectionStatus;

  @Column({
    type: 'enum',
    enum: ['Regular', 'Laboratory', 'Lecture', 'Combined'],
    default: 'Regular'
  })
  classType!: ClassType;

  @Column()
  semester!: string;

  @Column()
  academicYear!: string;

  @Column('int', { default: 30 })
  maxStudents!: number;

  @Column('int', { default: 0 })
  enrolledStudents!: number;

  @Column({ nullable: true })
  room?: string;

  @Column('jsonb', { nullable: true })
  timeSlots?: Array<{
    dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
    startTime: string; // "08:00"
    endTime: string;   // "11:00"
  }>;

  @Column('boolean', { default: false })
  isNightSection!: boolean;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Virtual property to check if section has conflicts
  get hasConflicts(): boolean {
    // This will be calculated in the service layer
    return false;
  }

  // Virtual property to get section display name
  get displayName(): string {
    return `${this.course?.code || ''} - ${this.sectionCode}`;
  }

  // Virtual property to check if section is fully assigned
  get isFullyAssigned(): boolean {
    return this.facultyId !== null && this.facultyId !== undefined;
  }

  // Virtual property to get occupancy rate
  get occupancyRate(): number {
    if (this.maxStudents === 0) return 0;
    return Math.round((this.enrolledStudents / this.maxStudents) * 100);
  }
}