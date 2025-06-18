import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: 'enum',
    enum: ['Admin', 'Chair', 'Faculty', 'Dean'],
    default: 'Faculty',
  })
  role!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ nullable: true })
  college!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}