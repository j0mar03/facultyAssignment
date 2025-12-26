import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Short code used everywhere, e.g. "IT204"
  @Column({ unique: true })
  code!: string;

  // Optional descriptive name, e.g. "Computer Lab 1"
  @Column({ nullable: true })
  name?: string;

  // Building or area, e.g. "IT Building"
  @Column({ nullable: true })
  building?: string;

  // Room type: Lecture, Laboratory, etc.
  @Column({
    type: 'enum',
    enum: ['Lecture', 'Laboratory', 'Multi-purpose', 'Other'],
    default: 'Lecture',
  })
  type!: 'Lecture' | 'Laboratory' | 'Multi-purpose' | 'Other';

  // Maximum number of students
  @Column('int', { default: 40 })
  capacity!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


